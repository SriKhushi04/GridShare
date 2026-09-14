import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { gridApi } from '../api/gridApi';

const GridContext = createContext(null);

export function GridProvider({ children }) {
  const [gridState, setGridState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch complete backend grid state
  const refreshGridState = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await gridApi.getGridState();
      setGridState(data);
      setError(null);
    } catch (err) {
      console.error('[GridContext] Failed to fetch grid state:', err);
      console.warn('[GridContext] Backend fetch error:', err);
      setError(err.message || 'Unable to connect to Grid Share Core');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshGridState(true);
  }, [refreshGridState]);

  // Simulation tick loop (every 5 seconds) — triggers backend tick unless paused
  useEffect(() => {
    if (isPaused || error) return;

    const timer = setInterval(async () => {
      try {
        const res = await gridApi.processTick();
        if (res && res.gridState) {
          setGridState(res.gridState);
        } else {
          await refreshGridState(false);
        }
      } catch (err) {
        console.error('[GridContext] Tick error:', err);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, error, refreshGridState]);

  // Scenario selection
  const setScenario = async (scenario) => {
    setActionLoading(true);
    try {
      const res = await gridApi.setScenario(scenario);
      if (res && res.gridState) {
        setGridState(res.gridState);
      } else {
        await refreshGridState(false);
      }
    } catch (err) {
      console.error('[GridContext] Set scenario error:', err);
      setError(`Failed to set scenario: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Manual energy allocation trigger
  const triggerAllocate = async () => {
    setActionLoading(true);
    try {
      const res = await gridApi.allocateEnergy();
      if (res && res.gridState) {
        setGridState(res.gridState);
      } else {
        await refreshGridState(false);
      }
      return res;
    } catch (err) {
      console.error('[GridContext] Allocation error:', err);
      setError(`Energy allocation failed: ${err.message}`);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Reset simulation
  const reset = async () => {
    setActionLoading(true);
    try {
      const res = await gridApi.resetSimulation();
      if (res && res.gridState) {
        setGridState(res.gridState);
      } else {
        await refreshGridState(false);
      }
      setIsPaused(false);
      setError(null);
    } catch (err) {
      console.error('[GridContext] Reset error:', err);
      setError(`Reset failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Utility Main Grid Status (ONLINE / OFFLINE)
  const toggleMainGrid = async () => {
    setActionLoading(true);
    try {
      const nextStatus = gridState?.mainGrid?.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
      const res = await gridApi.setMainGridStatus(nextStatus);
      if (res && res.gridState) {
        setGridState(res.gridState);
      } else {
        await refreshGridState(false);
      }
    } catch (err) {
      console.error('[GridContext] Toggle main grid error:', err);
      setError(`Grid intertie toggle failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const togglePause = () => setIsPaused((prev) => !prev);
  const pause = () => setIsPaused(true);
  const resume = () => setIsPaused(false);

  // Normalize shape consumed by frontend UI components
  const normalizedState = gridState
    ? {
        ...gridState,
        tickId: gridState.tickId ?? 0,
        tickCount: gridState.tickId ?? 0,
        currentTick: gridState.tickId ?? 0,
        logs: gridState.logs || gridState.activity || [],
        summaryStats: gridState.summaryStats || {
          totalGeneration: 0,
          totalConsumption: 0,
          p2pTransfer: 0,
          centralBattery: gridState.centralBattery?.percentage || 0,
          mainGridDependency: 0,
        },
        isPaused,
      }
    : null;

  const [agentRunning, setAgentRunning] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [agentStatus, setAgentStatus] = useState(null);

  // Fetch Agent Status
  const fetchAgentStatus = useCallback(async () => {
    try {
      const status = await gridApi.getAgentStatus();
      setAgentStatus(status);
    } catch (err) {
      console.warn('[GridContext] Agent status fetch warning:', err);
    }
  }, []);

  useEffect(() => {
    fetchAgentStatus();
  }, [fetchAgentStatus]);

  // Run Agentic AI decision cycle
  const runAgent = async (objective) => {
    setAgentRunning(true);
    try {
      const res = await gridApi.runAgent(objective);
      if (res && res.gridState) {
        setGridState(res.gridState);
      } else {
        await refreshGridState(false);
      }
      await fetchAgentStatus();
      return res;
    } catch (err) {
      console.error('[GridContext] Run Agent error:', err);
      setError(`Agent run failed: ${err.message}`);
    } finally {
      setAgentRunning(false);
    }
  };

  // Auto Mode interval loop
  useEffect(() => {
    if (!autoMode || isPaused || error) return;

    const autoTimer = setInterval(async () => {
      try {
        const res = await gridApi.runAgent();
        if (res && res.gridState) {
          setGridState(res.gridState);
        }
      } catch (err) {
        console.error('[GridContext] Auto Mode Agent error:', err);
      }
    }, agentStatus?.autoIntervalMs ?? 10000);

    return () => clearInterval(autoTimer);
  }, [autoMode, isPaused, error, agentStatus?.autoIntervalMs]);

  const toggleAutoMode = () => setAutoMode((prev) => !prev);

  const value = {
    state: normalizedState,
    loading,
    error,
    actionLoading,
    agentRunning,
    autoMode,
    agentStatus,
    refreshGridState,
    setScenario,
    triggerAllocate,
    runAgent,
    toggleAutoMode,
    toggleMainGrid,
    togglePause,
    pause,
    resume,
    reset,
  };

  return <GridContext.Provider value={value}>{children}</GridContext.Provider>;
}

export function useGrid() {
  const context = useContext(GridContext);
  if (!context) {
    throw new Error('useGrid must be used within a GridProvider');
  }
  return context;
}

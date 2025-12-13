/**
 * Trip Store
 * Global state management for trips using Zustand
 */

import { create } from 'zustand';
import { Trip, CreateTripModel, UpdateTripModel } from '../types/database';
import databaseService from '../services/database/databaseService';

interface TripState {
  trips: Trip[];
  isLoading: boolean;
  error: string | null;
  selectedTrip: Trip | null;

  // Actions
  fetchTrips: () => Promise<void>;
  createTrip: (model: CreateTripModel) => Promise<Trip>;
  updateTrip: (model: UpdateTripModel) => Promise<Trip>;
  deleteTrip: (id: number) => Promise<void>;
  selectTrip: (trip: Trip | null) => void;
  clearError: () => void;
}

export const useTripStore = create<TripState>(set => ({
  trips: [],
  isLoading: false,
  error: null,
  selectedTrip: null,

  fetchTrips: async () => {
    set({ isLoading: true, error: null });
    try {
      const trips = await databaseService.getAllTrips();
      set({ trips, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch trips';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  createTrip: async (model: CreateTripModel) => {
    set({ isLoading: true, error: null });
    try {
      const newTrip = await databaseService.createTrip(model);
      set(state => ({
        trips: [newTrip, ...state.trips],
        isLoading: false,
      }));
      return newTrip;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create trip';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateTrip: async (model: UpdateTripModel) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTrip = await databaseService.updateTrip(model);
      set(state => ({
        trips: state.trips.map(trip => (trip.id === updatedTrip.id ? updatedTrip : trip)),
        selectedTrip: state.selectedTrip?.id === updatedTrip.id ? updatedTrip : state.selectedTrip,
        isLoading: false,
      }));
      return updatedTrip;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update trip';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteTrip: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await databaseService.deleteTrip(id);
      set(state => ({
        trips: state.trips.filter(trip => trip.id !== id),
        selectedTrip: state.selectedTrip?.id === id ? null : state.selectedTrip,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete trip';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  selectTrip: (trip: Trip | null) => {
    set({ selectedTrip: trip });
  },

  clearError: () => {
    set({ error: null });
  },
}));

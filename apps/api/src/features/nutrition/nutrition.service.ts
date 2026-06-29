import type { CreateFoodInput, UpdateFoodInput } from '@gym-bro/shared';

import { ConflictError, NotFoundError } from '../../lib/errors';
import * as nutritionRepository from './nutrition.repository';

// Business logic for the nutrition domain — ownership checks, conflict mapping,
// macro computation. No Drizzle here. Grown per resource, foods first.

function hasPgCode(value: unknown, code: string): boolean {
  return typeof value === 'object' && value !== null && 'code' in value && value.code === code;
}

// Postgres unique_violation, mapped to a 409. Drizzle wraps the driver error so
// the pg code lives on the cause; check both levels. (Same check as the other
// feature services; kept local to keep the feature self-contained.)
function isUniqueViolation(error: unknown): boolean {
  if (hasPgCode(error, '23505')) {
    return true;
  }
  if (typeof error === 'object' && error !== null && 'cause' in error) {
    return hasPgCode(error.cause, '23505');
  }
  return false;
}

// --- Foods ---

export async function listFoods(userId: string, search?: string) {
  return nutritionRepository.listFoods(userId, search);
}

export async function createFood(userId: string, input: CreateFoodInput) {
  try {
    return await nutritionRepository.createFood(userId, input);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError('A food with this name already exists');
    }
    throw error;
  }
}

export async function updateFood(userId: string, id: string, input: UpdateFoodInput) {
  let food;
  try {
    food = await nutritionRepository.updateFood(userId, id, input);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError('A food with this name already exists');
    }
    throw error;
  }
  if (!food) {
    throw new NotFoundError('Food not found');
  }
  return food;
}

export async function deleteFood(userId: string, id: string) {
  const food = await nutritionRepository.softDeleteFood(userId, id);
  if (!food) {
    throw new NotFoundError('Food not found');
  }
  return food;
}

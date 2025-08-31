import { Types } from 'mongoose';

export function convertObjectIdToString<T extends { _id?: any }>(obj: T): T & { _id: string } {
  if (!obj) return obj as T & { _id: string };
  
  const converted = { ...obj } as any;
  
  // Convertir _id principal
  if (converted._id) {
    converted._id = converted._id.toString();
  }
  
  // Convertir ObjectIds anidados comunes
  if (converted.machineId?._id) {
   converted.machineId = converted.machineId._id.toString();
  }
  
  if (converted.technicianId?._id) {
    converted.technicianId = converted.technicianId._id.toString();
  }
  
  return converted as T & { _id: string };
}

export function convertArrayObjectIdsToString<T extends { _id?: any }>(array: T[]): (T & { _id: string })[] {
  return array.map(item => convertObjectIdToString(item));
} 

export function convertIdsToString<T extends { _id?: any }>(id: T): (T & { _id: string }) {
  return convertObjectIdToString(id);
} 
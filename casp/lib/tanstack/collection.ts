import {createCollection} from '@tanstack/react-db'
import { electricCollectionOptions } from "@tanstack/electric-db-collection";

const employeeCollection = createCollection(electricCollectionOptions({
    id: 'employeeCollection',
    
   shapeOptions: {
    url: '/api/database_fetch/getEmployees',
  },
  getKey: (employee) => employee.id,
}))
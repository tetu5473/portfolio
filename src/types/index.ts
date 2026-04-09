export interface User {
  id: string
  name: string
  nameKana: string
  birthDate: string
  gender: 'male' | 'female'
  careLevel: '要支援1' | '要支援2' | '要介護1' | '要介護2' | '要介護3' | '要介護4' | '要介護5'
  address: string
  phone: string
  emergencyContact: string
  staffName: string
  createdAt: string
}

export interface CarePlan {
  id: string
  userId: string
  longTermGoal: string
  shortTermGoal: string
  services: string
  startDate: string
  endDate: string
  createdAt: string
}

export interface ProgressNote {
  id: string
  userId: string
  date: string
  author: string
  content: string
  createdAt: string
}

export interface Monitoring {
  id: string
  userId: string
  date: string
  author: string
  physicalCondition: string
  mentalCondition: string
  serviceStatus: string
  issues: string
  createdAt: string
}

export interface Meeting {
  id: string
  userId: string
  date: string
  location: string
  participants: string
  agenda: string
  discussion: string
  conclusion: string
  futureTasks: string
  createdAt: string
}

export interface WeatherData {
  city: string
  temp: number
  description: string
  icon: string
  humidity: number
}

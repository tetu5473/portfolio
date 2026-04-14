/**
 * types/index.ts — アプリ全体で使用する型定義
 * User・CarePlan・ProgressNote・Monitoring・Meeting・WeatherData の型を定義する
 */

/** 利用者情報 */
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

/** ケアプラン（長期・短期目標とサービス内容） */
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

/** 支援経過記録 */
export interface ProgressNote {
  id: string
  userId: string
  date: string
  author: string
  content: string
  createdAt: string
}

/** モニタリング記録（身体・精神状態、サービス利用状況、課題） */
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

/** 担当者会議記録 */
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

/** 天気情報（ヘッダーに表示） */
export interface WeatherData {
  city: string
  temp: number
  description: string
  icon: string
  humidity: number
}

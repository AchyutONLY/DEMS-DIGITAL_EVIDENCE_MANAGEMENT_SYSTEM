export type Role = 'admin' | 'inspector' | 'officer'

export interface MeUser {
  UserID: number
  Name: string
  Role: Role | string
  BadgeNumber: string
  Contact: string | null
  Status: string
  LastLogin: string | null
}

export interface CaseOut {
  CaseID: number
  ActingInspectorID: number
  Title: string
  Type: string
  Status: string
  Description: string | null
  DateOpened: string
  DateClosed: string | null
}

export interface CaseCreateBody {
  Title: string
  Type: string
  Status: string
  Description?: string | null
  AssignedOfficerIDs: number[]
}

export interface CaseUpdateBody {
  Title?: string
  Type?: string
  Status?: string
  Description?: string | null
}

export interface UserResponse {
  UserID: number
  Name: string
  Role: string
  BadgeNumber: string
  Contact: string | null
  Status: string
  LastLogin: string | null
}

export interface UserCreateBody {
  Name: string
  Role: string
  BadgeNumber: string
  Contact?: string | null
  Status: string
  Password: string
}

export interface UserUpdateBody {
  Name?: string
  Role?: string
  Contact?: string | null
  Status?: string
  Password?: string
}

export interface AssignedOfficerRow {
  UserID: number
  BadgeNumber: string
  Status: string
  Contact: string
  Name: string
  Role: string
}

export interface EvidenceResponse {
  EvidenceID: number
  CaseID: number
  Description: string | null
  EvidenceType: string | null
  SourceOrigin: string | null
  FilePath: string | null
}

export interface EvidenceUpdateBody {
  Description?: string | null
  EvidenceType?: string | null
  SourceOrigin?: string | null
}

export interface CustodyResponse {
  RecordID: number
  EvidenceID: number
  Timestamp: string | null
  ActingOfficerID: number
  Notes: string | null
}

export interface CustodyCreateBody {
  EvidenceID: number
  ActingOfficerID: number
  Notes?: string | null
  Timestamp?: string | null
}

export interface CustodyUpdateBody {
  Timestamp?: string | null
  ActingOfficerID?: number | null
  Notes?: string | null
}

export interface AuditResponse {
  LogID: number
  Timestamp: string | null
  UserID: number
  EventType: string
  Details: string
}

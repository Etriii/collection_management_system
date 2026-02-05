export interface Timestamps {
  created_at: string
  updated_at: string
}

export interface School extends Timestamps {
  id: number
  school_name: string
  short_name: string
  logo: string
  location: string
}


export interface Institute extends Timestamps {
  id: number
  institute_name: string
  logo: string
  school: School
}
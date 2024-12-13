// src/lib/image-helpers.ts
export const createObjectURL = (file: File): string => {
    if (typeof window === 'undefined') return ''
    return URL.createObjectURL(file)
  }
  
  export const revokeObjectURL = (url: string) => {
    if (typeof window === 'undefined') return
    URL.revokeObjectURL(url)
  }
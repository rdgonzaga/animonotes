import { describe, it, expect } from 'vitest'

describe('Example Test Suite', () => {
  it('should pass a basic assertion', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    const greeting = 'Hello, Hase Forum!'
    expect(greeting).toContain('Hase Forum')
  })

  it('should work with arrays', () => {
    const items = ['setup', 'testing', 'deployment']
    expect(items).toHaveLength(3)
    expect(items[0]).toBe('setup')
  })
})

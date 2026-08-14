import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Sin esto, el DOM renderizado en una prueba se filtraría a la siguiente.
afterEach(() => {
  cleanup()
})

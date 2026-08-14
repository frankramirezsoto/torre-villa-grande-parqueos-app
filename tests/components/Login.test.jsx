import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Login from '../../src/components/Login'
import { useAuth } from '../../src/hooks/useAuth'

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: vi.fn()
}))

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('C1: envía el correo y la contraseña ingresados a signIn', async () => {
    const signIn = vi.fn().mockResolvedValue({ data: { session: {} }, error: null })
    useAuth.mockReturnValue({ signIn })

    render(<Login />)
    await userEvent.type(screen.getByLabelText('Usuario'), 'guarda@torrevillagrande.cr')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'clave-segura')
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(signIn).toHaveBeenCalledWith('guarda@torrevillagrande.cr', 'clave-segura')
  })

  it('C2: muestra un mensaje de error cuando las credenciales son inválidas', async () => {
    const signIn = vi.fn().mockResolvedValue({ data: null, error: { message: 'Invalid login credentials' } })
    useAuth.mockReturnValue({ signIn })

    render(<Login />)
    await userEvent.type(screen.getByLabelText('Usuario'), 'guarda@torrevillagrande.cr')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'clave-incorrecta')
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByText('Usuario o contraseña incorrectos.')).toBeInTheDocument()
  })
})

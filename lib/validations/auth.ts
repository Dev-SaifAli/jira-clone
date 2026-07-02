import { email, z } from 'zod'

// Run-time validation schema

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .trim(),

  email: z.string().min(1).email('Invalid email format').toLowerCase().trim(),
  password: z
    .string()
    .trim()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password too long')
    .regex(
      passwordRegex,
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
    )
})

export const loginSchema = z.object({
  email: z
    .string()
    .toLowerCase()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email format'),

  password: z.string().min(1, 'Password is required')
})

export type registerInput = z.infer<typeof registerSchema>
export type loginInput = z.infer<typeof loginSchema>

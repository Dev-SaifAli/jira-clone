import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod/v3'
import { User } from '@/models/User'
import dbConnect from '@/lib/db'
import bcrypt from 'bcrypt'
import { registerSchema } from '@/lib/validations/auth'

export async function POST (req: NextRequest) {
  try {
    const body = await req.json()

    // ‍Zod Validation
    const validatedData = registerSchema.parse(body)
    const { name, email, password } = validatedData

    await dbConnect()

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'Email already registered'
        },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    })

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: { id: user._id, name: user.name, email: user.email }
      },
      { status: 201 }
    )
  } catch (error) {
    // Zod validation error - specific fields error return
    if (error instanceof ZodError) {
      const fieldErrors = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))

      return NextResponse.json(
        {
          error: 'Validation failed',
          details: fieldErrors
        },
        { status: 400 }
      )
    }

    // JSON parse error (malformed body)
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    // MongoDB duplicate key error
    if (error instanceof Error && error.message.includes('E11000')) {
      return NextResponse.json(
        {
          error: 'Email already registered.'
        },
        { status: 409 }
      )
    }
  }
}

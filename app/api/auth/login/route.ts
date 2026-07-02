import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/models/User'
import bcrypt from 'bcrypt'
import dbConnect from '@/lib/db'
import jwt from 'jsonwebtoken'
import { loginSchema } from '@/lib/validations/auth'

export async function POST (req: NextRequest) {
  try {
    const body = await req.json()

    const validatedData = loginSchema.parse(body)

    const { email, password } = validatedData

    await dbConnect()

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: { id: user._id, email: user.email, name: user.name }
      },
      { status: 200 }
    )

    // JWT Sign
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    )

    response.cookies.set('token', token, {
      httpOnly: true, // Prevents XSS vulnerability - client side JS cannot read
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // prevents CSRF
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: '/'
    })

    return response
  } catch (error) {
    console.error("Login error: ", error)
    return NextResponse.json(
      {error: "Internal server error"},
      {status: 400}
    )
  }
}

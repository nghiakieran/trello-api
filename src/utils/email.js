import { Resend } from 'resend'
import { env } from '~/config/environment'

export const resend = new Resend(env.RESEND)

export const sendVerifyEmail = async (to, token) => {
  const verifyLink = `http://localhost:5173/account/verification?token=${token}&email=${encodeURIComponent(to)}`

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to,
    subject: 'Verify your account',
    html: `
      <h2>Verify your account</h2>
      <p>Click link below:</p>
      <a href="${verifyLink}">Verify Account</a>
    `
  })
}

import emailjs from '@emailjs/browser'

export interface EmailParams {
  to: string
  subject: string
  body: string
}

export function isEmailJSConfigured(): boolean {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  return Boolean(serviceId && templateId && publicKey)
}

export async function sendEmail(params: EmailParams): Promise<void> {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID as string
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string

  await emailjs.send(
    serviceId,
    templateId,
    {
      to_email: params.to,
      subject: params.subject,
      message: params.body,
    },
    { publicKey }
  )
}

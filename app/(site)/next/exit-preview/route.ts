import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request): Promise<Response> {
  const draft = await draftMode()
  draft.disable()

  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path') || '/'

  if (!path.startsWith('/') || path.includes('null') || path.includes('undefined')) {
    redirect('/')
  }

  redirect(path)
}

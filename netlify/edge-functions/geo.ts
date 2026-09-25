// Tags each page request with the visitor's country so the site can pick
// Albanian (AL) or English (everywhere else) on the first visit.
export default async (_request: Request, context: { next: () => Promise<Response>; geo?: { country?: { code?: string } } }) => {
  const response = await context.next()
  const country = context.geo?.country?.code
  if (country) {
    response.headers.append('set-cookie', `ad_geo=${country}; Path=/; Max-Age=86400; SameSite=Lax`)
  }
  return response
}

export const config = { path: '/' }

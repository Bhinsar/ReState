import ResetPassword from '@/components/pages/resetPassword/resetPassword'

export default function ResetPasswordPage({params}: {params: {email: string}}) {
  return (
    <ResetPassword email={decodeURIComponent(params.email)}/>
  )
}

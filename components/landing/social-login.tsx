import Icon from '@/components/ui/icon'

export default function SocialLogin() {
  return (
    <>
      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="border-t border-gray-800 grow mr-3" aria-hidden="true" />
        <div className="text-sm text-gray-400 italic">Or</div>
        <div className="border-t border-gray-800 grow ml-3" aria-hidden="true" />
      </div>
      {/* Social login */}
      <button
        type="button"
        className="btn-sm text-white bg-linear-to-t from-pink-500 to-pink-400 hover:to-pink-500 w-full relative flex after:flex-1"
      >
        <div className="flex-1 flex items-center">
          <Icon name="logo-google" className="w-4 h-4 text-pink-200 shrink-0" />
        </div>
        <span className="flex-auto text-pink-50 pl-3">Continue With Google</span>
      </button>
    </>
  )
}
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"

const Login = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#121212]">
      <Card className="w-[400px] bg-[#D9D9D9] border-none">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Welcome!</CardTitle>
          <p className="text-center text-muted-foreground">Please enter your details</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full bg-white text-black font-bold">Log in with Google</Button>
          <div className="flex items-center gap-2 text-sm">
            <hr className="flex-1 border-gray-400" /> <span>or</span> <hr className="flex-1 border-gray-400" />
          </div>
          <Input type="email" placeholder="Email" className="bg-gray-100" />
          <Input type="password" placeholder="Password" className="bg-gray-100" />
          <Button className="w-full bg-[#5B89B1] hover:bg-[#4a7294] text-white">Log in</Button>
          <p className="text-center text-sm">
            Don't have an account? <Link to="/signup" className="text-blue-600 font-bold">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
export default Login;
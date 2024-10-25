// pages/login.tsx
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { UserCircle, Shield, Lock } from 'lucide-react'
import { useState } from 'react'

const LoginPage: NextPage = () => {
  const router = useRouter();
  const { type } = router.query;
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async () => {
    // 這裡添加實際的登入邏輯
    // 暫時模擬登入成功
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            {type === 'helper' ? (
              <Shield className="w-6 h-6 text-green-500" />
            ) : (
              <UserCircle className="w-6 h-6 text-blue-500" />
            )}
            <h1 className="text-2xl font-bold">
              {type === 'helper' ? '協助者登入' : '用戶登入'}
            </h1>
          </div>
          <p className="text-gray-500">
            {type === 'helper' ? '歡迎回來，專業的引導者' : '歡迎回到任務冒險世界'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">電子郵件</label>
              <Input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">密碼</label>
              <Input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({
                  ...prev,
                  password: e.target.value
                }))}
                placeholder="••••••••"
              />
            </div>
            <Button 
              className="w-full"
              onClick={handleLogin}
            >
              <Lock className="w-4 h-4 mr-2" />
              登入
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
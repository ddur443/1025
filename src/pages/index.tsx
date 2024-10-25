// pages/index.tsx
import type { NextPage } from 'next'
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardContent } from "../components/ui/card"
import { 
  UserCircle, 
  Shield, 
  Globe,
  PlusCircle
} from 'lucide-react'
import { useRouter } from 'next/router'
import { useState } from 'react'

const HomePage: NextPage = () => {
  const router = useRouter();
  const [showExplore, setShowExplore] = useState(false);

  // 添加一個導航函數
  const handleTaskClick = () => {
    // 假設我們導航到一個示例任務
    router.push('/task/1');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold mb-6 flex items-center justify-center gap-2">
            <Globe className="w-8 h-8" />
            任務冒險世界
          </h1>
          <p className="text-xl text-gray-600 mb-12">選擇您的角色開始冒險</p>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* 一般用戶登入卡片 */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <UserCircle className="w-16 h-16 text-blue-500 mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">一般用戶</h2>
                  <p className="text-gray-600 text-center mb-4">
                    發布任務、參與項目、提供建議
                  </p>
                  <Button onClick={() => router.push('/task/1')}>
                    以用戶身份進入
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 協助者登入卡片 */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <Shield className="w-16 h-16 text-green-500 mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">協助者</h2>
                  <p className="text-gray-600 text-center mb-4">
                    管理任務、審核建議、優化流程
                  </p>
                  <Button onClick={() => router.push('/task/1')}>
                    以協助者身份進入
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 探索按鈕 */}
          <div className="mt-8">
            <Button 
              variant="outline"
              onClick={() => setShowExplore(!showExplore)}
            >
              <Globe className="w-4 h-4 mr-2" />
              探索進行中的項目
            </Button>
          </div>

          {/* 探索項目區域 */}
          {showExplore && (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card 
                  key={i} 
                  className="text-left hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={handleTaskClick}
                >
                  <CardHeader>
                    <h3 className="text-lg font-semibold">示例項目 {i}</h3>
                    <p className="text-sm text-gray-500">進行中</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      這是一個示例項目描述，展示項目的基本信息和進度。
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-2 bg-blue-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{width: `${(i * 30)}%`}}
                          />
                        </div>
                        <span className="text-sm text-gray-500">{i * 30}%</span>
                      </div>
                      <Button variant="outline" size="sm">
                        查看詳情
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomePage
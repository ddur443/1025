// pages/dashboard.tsx
import type { NextPage } from 'next'
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardContent } from "../components/ui/card"
import { 
  Globe, 
  PlusCircle, 
  Users, 
  GitBranch,
  Calendar
} from 'lucide-react'
import { useRouter } from 'next/router'

const DashboardPage: NextPage = () => {
  const router = useRouter();
  const isHelper = router.query.type === 'helper';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6" />
              <h1 className="text-xl font-bold">
                {isHelper ? '協助者儀表板' : '任務儀表板'}
              </h1>
            </div>
            <Button onClick={() => router.push('/create-task')}>
              <PlusCircle className="w-4 h-4 mr-2" />
              {isHelper ? '創建新任務' : '發布任務'}
            </Button>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <main className="max-w-6xl mx-auto p-4">
        <div className="grid gap-6">
          {/* 任務卡片 */}
          {[1, 2, 3].map((i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">示例任務 {i}</h2>
                    <p className="text-gray-600 mb-4">
                      這是一個示例任務描述，說明任務目標和要求。
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {i + 2} 位協作者
                      </div>
                      <div className="flex items-center">
                        <GitBranch className="w-4 h-4 mr-1" />
                        {i * 2} 個建議
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        下次會議: 2024/10/{25 + i}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isHelper ? (
                      <Button variant="outline">
                        審核建議
                      </Button>
                    ) : (
                      <Button variant="outline">
                        提出建議
                      </Button>
                    )}
                    <Button>
                      查看詳情
                    </Button>
                  </div>
                </div>

                {/* 進度條 */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{width: `${i * 30}%`}}
                    />
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">進度: {i * 30}%</span>
                    <span className="text-blue-600">進行中</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
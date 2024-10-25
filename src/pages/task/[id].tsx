// pages/task/[id].tsx
import type { NextPage } from 'next'
import { Button } from "../../components/ui/button"
import { Card, CardHeader, CardContent } from "../../components/ui/card"
import { 
  Users, 
  GitBranch, 
  Calendar,
  MessageCircle,
  ArrowLeft,
  Clock,
  CheckCircle2,
  GitMerge,
  FileText,
  PlusCircle
} from 'lucide-react'
import { useRouter } from 'next/router'
import { useState } from 'react'

const TaskDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState<'overview' | 'flow' | 'suggestions' | 'meetings'>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
              <h1 className="text-xl font-bold">網站重設計項目 #{id}</h1>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">進行中</span>
            </div>
            <Button 
              onClick={() => router.push(`/meeting-room/${id}`)}
              variant="default"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              加入會議
            </Button>
          </div>

          {/* 頁籤 */}
          <div className="flex gap-4 mt-4">
            {[
              { key: 'overview', label: '概覽', icon: FileText },
              { key: 'flow', label: '流程圖', icon: GitMerge },
              { key: 'suggestions', label: '建議', icon: GitBranch },
              { key: 'meetings', label: '會議', icon: Calendar }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={activeTab === key ? 'default' : 'ghost'}
                onClick={() => setActiveTab(key as any)}
                className="flex items-center"
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <main className="max-w-6xl mx-auto p-4">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              {/* 項目描述 */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">項目描述</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    這是一個網站重設計項目，主要目標是提升用戶體驗和轉換率。
                    項目包含用戶研究、界面設計、前端開發等多個階段。
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">目標</h3>
                      <ul className="list-disc list-inside text-gray-600">
                        <li>提升用戶體驗</li>
                        <li>增加轉換率</li>
                        <li>優化載入速度</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">時程</h3>
                      <ul className="list-disc list-inside text-gray-600">
                        <li>開始: 2024/10/22</li>
                        <li>預計完成: 2024/12/31</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 任務進度 */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">任務進度</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['需求分析', '用戶研究', 'UI設計', '前端開發', '後端開發'].map((phase, i) => (
                      <div key={phase} className="flex items-center gap-4">
                        <div className="w-24 flex-shrink-0">{phase}</div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all"
                            style={{width: `${Math.min(100, i * 25)}%`}}
                          />
                        </div>
                        <div className="w-16 text-right text-gray-600">
                          {Math.min(100, i * 25)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右側資訊 */}
            <div className="space-y-6">
              {/* 團隊資訊 */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">團隊資訊</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>5 位成員</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({length: 5}).map((_, i) => (
                        <div 
                          key={i}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm"
                        >
                          U{i+1}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 下次會議 */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">下次會議</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>2024/10/25 15:00</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>預計時長: 1小時</span>
                    </div>
                    <Button className="w-full">
                      加入會議
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'flow' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">流程圖</h2>
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  編輯流程
                </Button>
              </div>
              <div className="h-[600px] border rounded-lg bg-white p-4">
                {/* 這裡可以使用 react-flow 或其他流程圖庫 */}
                <div className="flex items-center justify-center h-full text-gray-500">
                  流程圖展示區域
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">優化建議</h2>
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                提出建議
              </Button>
            </div>

            {/* 建議列表 */}
            {Array.from({length: 3}).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          U{i+1}
                        </div>
                        <span className="font-medium">用戶 {i+1}</span>
                        <span className="text-sm text-gray-500">2天前</span>
                      </div>
                      <h3 className="text-lg font-medium mb-2">
                        優化建議 #{i+1}
                      </h3>
                      <p className="text-gray-600">
                        這是一個示例建議，描述如何改進當前的流程或設計。
                      </p>
                      <div className="flex gap-2 mt-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                          UI優化
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                          效能提升
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        查看詳情
                      </Button>
                      <Button>
                        採納建議
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'meetings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">會議記錄</h2>
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                排程會議
              </Button>
            </div>

            {/* 會議列表 */}
            {Array.from({length: 3}).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        週期性進度會議 #{3-i}
                      </h3>
                      <div className="flex items-center gap-4 text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          2024/10/{20+i}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          15:00 - 16:00
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          5 位參與者
                        </div>
                      </div>
                      <div className="text-gray-600">
                        <h4 className="font-medium mb-2">討論重點：</h4>
                        <ul className="list-disc list-inside">
                          <li>當前進度回顧</li>
                          <li>遇到的問題和解決方案</li>
                          <li>下階段目標設定</li>
                        </ul>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        查看記錄
                      </Button>
                      {i === 0 && (
                        <Button>
                          加入會議
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default TaskDetail
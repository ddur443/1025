import type { NextPage } from 'next'
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardContent } from "../components/ui/card"
import { ArrowLeft, Mail, Phone, Clock, Users, Briefcase, DollarSign } from 'lucide-react'
import { useRouter } from 'next/router'
import { Input } from "../components/ui/input"
import { useState } from 'react'

interface FormData {
  username: string;
  email: string;
  phone: string;
  skills: string[];
  availableTime: string[];
  projectType: string[];
  teamSize: {
    min: number;
    max: number;
  };
  budget: {
    range: string;
    isNegotiable: boolean;
  };
  projectDescription: string;
}

// 定義可以進行多選的字段
type ArrayFields = 'skills' | 'availableTime' | 'projectType';

// 檢查字段是否是多選字段
const isArrayField = (field: keyof FormData): field is ArrayFields => {
  return ['skills', 'availableTime', 'projectType'].includes(field as string);
};

const SKILLS_OPTIONS = [
  '程式開發', '產品設計', '市場行銷',
  '專案管理', '數據分析', '研究開發',
  'UI/UX設計', '內容創作', '業務發展',
  '人工智能', '區塊鏈', '雲端架構'
];

const TIME_SLOTS = [
  '平日早上', '平日下午', '平日晚上',
  '週末早上', '週末下午', '週末晚上'
];

const PROJECT_TYPES = [
  '網站開發', '手機應用', '資料分析',
  '市場調研', '品牌設計', '內容製作',
  '教育培訓', '商業企劃', '科技研發'
];

const BUDGET_RANGES = [
  '10萬以下',
  '10-30萬',
  '30-50萬',
  '50-100萬',
  '100萬以上'
];

const CreateCharacterPage: NextPage = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
      username: '',
      email: '',
      phone: '',
      skills: [],
      availableTime: [],
      projectType: [],
      teamSize: {
        min: 2,
        max: 5
      },
      budget: {
        range: '',
        isNegotiable: true
      },
      projectDescription: ''
    });
  
    const handleBack = () => {
      router.push('/');
    };
  
    const toggleSelection = (field: ArrayFields, value: string) => {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].includes(value)
          ? prev[field].filter(item => item !== value)
          : [...prev[field], value]
      }));
    };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首頁
          </Button>
        </div>

        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">創建你的冒險者角色</h1>
            <p className="text-gray-500">
              步驟 {step}/4: 
              {step === 1 && "基本資料"}
              {step === 2 && "專長與時間"}
              {step === 3 && "項目需求"}
              {step === 4 && "團隊與預算"}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {step === 1 && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      冒險者名稱
                    </label>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        username: e.target.value
                      }))}
                      placeholder="輸入你的冒險者名稱"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Mail className="inline w-4 h-4 mr-2" />
                      電子郵件
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Phone className="inline w-4 h-4 mr-2" />
                      聯絡電話
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        phone: e.target.value
                      }))}
                      placeholder="您的聯絡電話"
                    />
                  </div>
                </>
              )}

{step === 2 && (
      <>
        <div>
          <label className="block text-sm font-medium mb-2">專長領域（可多選）</label>
          <div className="grid grid-cols-3 gap-2">
            {SKILLS_OPTIONS.map(skill => (
              <Button
                key={skill}
                variant={formData.skills.includes(skill) ? 'default' : 'outline'}
                onClick={() => toggleSelection('skills', skill)}
                className="text-sm"
              >
                {skill}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            <Clock className="inline w-4 h-4 mr-2" />
            可配合時段（可多選）
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map(time => (
              <Button
                key={time}
                variant={formData.availableTime.includes(time) ? 'default' : 'outline'}
                onClick={() => toggleSelection('availableTime', time)}
                className="text-sm"
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      </>
    )}

    {step === 3 && (
      <>
        <div>
          <label className="block text-sm font-medium mb-2">計畫類型（可多選）</label>
          <div className="grid grid-cols-3 gap-2">
            {PROJECT_TYPES.map(type => (
              <Button
                key={type}
                variant={formData.projectType.includes(type) ? 'default' : 'outline'}
                onClick={() => toggleSelection('projectType', type)}
                className="text-sm"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Users className="inline w-4 h-4 mr-2" />
                      團隊規模
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-xs text-gray-500">最少人數</label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.teamSize.min}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            teamSize: {
                              ...prev.teamSize,
                              min: parseInt(e.target.value)
                            }
                          }))}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-500">最多人數</label>
                        <Input
                          type="number"
                          min={formData.teamSize.min}
                          value={formData.teamSize.max}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            teamSize: {
                              ...prev.teamSize,
                              max: parseInt(e.target.value)
                            }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <DollarSign className="inline w-4 h-4 mr-2" />
                      預算範圍
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {BUDGET_RANGES.map(range => (
                        <Button
                          key={range}
                          variant={formData.budget.range === range ? 'default' : 'outline'}
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            budget: {
                              ...prev.budget,
                              range
                            }
                          }))}
                          className="text-sm"
                        >
                          {range}
                        </Button>
                      ))}
                    </div>
                    <div className="mt-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.budget.isNegotiable}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            budget: {
                              ...prev.budget,
                              isNegotiable: e.target.checked
                            }
                          }))}
                          className="rounded text-primary"
                        />
                        <span className="text-sm text-gray-600">預算可商議</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      計畫說明
                    </label>
                    <textarea
                      value={formData.projectDescription}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        projectDescription: e.target.value
                      }))}
                      className="w-full h-32 p-2 border rounded-md"
                      placeholder="請簡述您的計畫內容、目標和期望、或是你所能提供的能力..."
                    />
                  </div>
                </>
              )}

              <div className="flex justify-between mt-6">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep(prev => prev - 1)}
                  >
                    上一步
                  </Button>
                )}
                {step < 4 ? (
                  <Button 
                    onClick={() => setStep(prev => prev + 1)}
                    className="ml-auto"
                  >
                    下一步
                  </Button>
                ) : (
                  <Button 
                    onClick={() => {
                      console.log('提交的表單數據:', formData);
                      // 這裡添加提交邏輯
                    }}
                    className="ml-auto"
                  >
                    提交申請
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CreateCharacterPage
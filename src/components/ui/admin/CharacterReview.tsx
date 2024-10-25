// components/admin/CharacterReview.tsx
// components/character/CharacterCreationForm.tsx
import React, { useState } from 'react'
import { Button } from "../../ui/button"  // 注意相對路徑
import { Card, CardHeader, CardContent } from "../../ui/card"
import type { InputProps } from "../../ui/input"
import { Input } from "../../ui/input"
import { User, Briefcase, GraduationCap, Mail, Phone, Shield, Check, X } from 'lucide-react'

interface CharacterApplication {
  id: string;
  username: string;
  email: string;
  profession: string;
  skills: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

const mockApplications: CharacterApplication[] = [
  {
    id: '1',
    username: '冒險者小明',
    email: 'ming@example.com',
    profession: '軟體工程師',
    skills: ['程式開發', '專案管理'],
    status: 'pending',
    submittedAt: '2024-10-22T10:30:00Z'
  },
  // 可以添加更多模擬數據
];

export const CharacterReview = () => {
  const [applications, setApplications] = useState<CharacterApplication[]>(mockApplications);

  const handleReview = async (id: string, approved: boolean) => {
    try {
      // 這裡添加向後端 API 發送審核結果的邏輯
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模擬 API 調用
      
      setApplications(prev => prev.map(app => {
        if (app.id === id) {
          return {
            ...app,
            status: approved ? 'approved' : 'rejected'
          };
        }
        return app;
      }));
    } catch (error) {
      console.error('審核操作失敗:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6" />
              角色審核管理
            </h2>
            <div className="text-sm text-gray-500">
              待審核: {applications.filter(app => app.status === 'pending').length}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.map(application => (
              <Card key={application.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <h3 className="font-semibold">{application.username}</h3>
                        <span className="text-sm text-gray-500">({application.email})</span>
                      </div>
                      <p className="text-sm text-gray-600">職業: {application.profession}</p>
                      <div className="flex flex-wrap gap-1">
                        {application.skills.map(skill => (
                          <span
                            key={skill}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    {application.status === 'pending' ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleReview(application.id, true)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          通過
                        </Button>
                        <Button
                          onClick={() => handleReview(application.id, false)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          <X className="w-4 h-4 mr-1" />
                          拒絕
                        </Button>
                      </div>
                    ) : (
                      <span className={`text-sm px-2 py-1 rounded ${
                        application.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {application.status === 'approved' ? '已通過' : '已拒絕'}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    提交時間: {new Date(application.submittedAt).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
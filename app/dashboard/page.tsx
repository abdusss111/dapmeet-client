"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Users, Clock, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    {
      title: "Всего встреч",
      value: "24",
      description: "За этот месяц",
      icon: CalendarDays,
    },
    {
      title: "Участники",
      value: "156",
      description: "Активные пользователи",
      icon: Users,
    },
    {
      title: "Время встреч",
      value: "48ч",
      description: "Общее время",
      icon: Clock,
    },
    {
      title: "Рост",
      value: "+12%",
      description: "По сравнению с прошлым месяцем",
      icon: TrendingUp,
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Панель управления</h1>
          <p className="text-muted-foreground">Обзор ваших встреч и активности</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Последние встречи</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Еженедельная планерка</p>
                    <p className="text-sm text-muted-foreground">Сегодня в 14:00</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Обзор проекта</p>
                    <p className="text-sm text-muted-foreground">Вчера в 16:30</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Статистика</CardTitle>
              <CardDescription>Активность за последние 7 дней</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">+201 с прошлой недели</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

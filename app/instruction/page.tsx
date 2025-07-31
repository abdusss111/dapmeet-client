"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Settings, Folder, Puzzle, CheckCircle } from "lucide-react"
import Image from "next/image"

export default function InstructionPage() {
  const handleDownload = () => {
    // TODO: Add actual download link
    console.log("Download extension")
  }

  const handleChromeExtensionsClick = () => {
    window.open("chrome://extensions", "_blank")
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            Как установить расширение dapmeet в Google Chrome (режим разработчика)
          </h1>
          <p className="text-gray-600">
            На этой странице вы можете скачать наше расширение и установить его в браузер Google Chrome в режиме
            разработчика. Следуйте пошаговой инструкции ниже:
          </p>
        </div>

        <div className="space-y-8">
          {/* Шаг 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />📥 Шаг 1. Скачайте расширение
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Нажмите на кнопку ниже, чтобы загрузить файл расширения:</p>
              <Button onClick={handleDownload} className="mb-4">
                <Download className="w-4 h-4 mr-2" />
                dapmeet.zip
              </Button>
              <div className="space-y-2">
                <p>• После скачивания у вас появится архив (.zip).</p>
                <p>• Распакуйте архив в удобную папку на компьютере.</p>
              </div>
            </CardContent>
          </Card>

          {/* Шаг 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                ⚙️ Шаг 2. Откройте настройки расширений в Chrome
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p>• Запустите браузер Google Chrome.</p>
                <p>
                  • В адресной строке введите:{" "}
                  <button
                    onClick={handleChromeExtensionsClick}
                    className="bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 cursor-pointer text-blue-600 underline"
                  >
                    chrome://extensions
                  </button>
                </p>
                <div className="my-4">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tg_image_647113129-rK6TQQBOReEf98H0LQbXxkFQUyX12K.png"
                    alt="Адресная строка Chrome с chrome://extensions"
                    width={400}
                    height={50}
                    className="border rounded"
                  />
                </div>
                <p>• Или в настройках Google Chrome: "Расширения" - "Управления расширениями"</p>
                <p>
                  • В правом верхнем углу включите <strong>Режим разработчика</strong> (Developer mode).
                </p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <Image
                  src="/placeholder.svg?height=200&width=400&text=Настройки+расширений"
                  alt="Настройки расширений Chrome"
                  width={400}
                  height={200}
                  className="mx-auto"
                />
              </div>
            </CardContent>
          </Card>

          {/* Шаг 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="w-5 h-5" />📂 Шаг 3. Установите расширение
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p>
                  • На открывшейся странице слева сверху нажмите кнопку{" "}
                  <strong>Загрузить распакованное расширение</strong> (Load unpacked).
                </p>
                <p>• Укажите путь к распакованной папке с нашим расширением.</p>
                <p>• После выбора папки расширение автоматически появится в списке установленных.</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <Image
                  src="/placeholder.svg?height=200&width=400&text=Загрузка+расширения"
                  alt="Загрузка расширения"
                  width={400}
                  height={200}
                  className="mx-auto"
                />
              </div>
            </CardContent>
          </Card>

          {/* Шаг 4 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Puzzle className="w-5 h-5" />🧩 Шаг 4. Проверьте работу
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p>• В верхнем правом углу Chrome появится иконка расширения.</p>
                <p>
                  • Нажмите на неё, чтобы запустить расширение, там потребуется авторизация через Google аккаунт (gmail
                  почту)
                </p>
                <p>• Если иконки не видно — нажмите на значок пазла 🧩 и закрепите расширение.</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <Image
                  src="/placeholder.svg?height=200&width=400&text=Проверка+работы"
                  alt="Проверка работы расширения"
                  width={400}
                  height={200}
                  className="mx-auto"
                />
              </div>
            </CardContent>
          </Card>

          {/* Шаг 5 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />✅ Шаг 5. Всё готово!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">
                Перейдите в <strong>"Мои встречи"</strong> на dapmeet
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

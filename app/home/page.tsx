"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Play,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  Plus,
  LogOut,
  Settings,
  UserIcon,
  Heart,
  Clock,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
}

interface VideoContent {
  id: string
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string
  category: string
  duration: string
  uploadDate: string
  userId: string
  views: number
  liked: boolean
}

interface NetflixHomeProps {
  user: User
  onLogout: () => void
}

const defaultFeatured = {
  title: "Welcome to Your Personal Netflix",
  description:
    "Start building your video library by uploading your favorite content. Your videos are private and only visible to you.",
  image: "/placeholder.svg?height=600&width=1200",
}

export default function NetflixHome({ user, onLogout }: NetflixHomeProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [playerOpen, setPlayerOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [currentVideo, setCurrentVideo] = useState<VideoContent | null>(null)
  const [videos, setVideos] = useState<VideoContent[]>([])
  const [featuredContent, setFeaturedContent] = useState(defaultFeatured)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("home")
  const [watchHistory, setWatchHistory] = useState<VideoContent[]>([])
  const [likedVideos, setLikedVideos] = useState<VideoContent[]>([])

  // Form states
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "",
    videoFile: null as File | null,
    thumbnailFile: null as File | null,
  })

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    email: user.email,
  })

  // Load user-specific data
  useEffect(() => {
    const userVideosKey = `netflix-videos-${user.id}`
    const userHistoryKey = `netflix-history-${user.id}`
    const userLikedKey = `netflix-liked-${user.id}`

    const savedVideos = localStorage.getItem(userVideosKey)
    const savedHistory = localStorage.getItem(userHistoryKey)
    const savedLiked = localStorage.getItem(userLikedKey)

    if (savedVideos) {
      const parsedVideos = JSON.parse(savedVideos)
      setVideos(parsedVideos)
      if (parsedVideos.length > 0) {
        setFeaturedContent({
          title: parsedVideos[0].title,
          description: parsedVideos[0].description,
          image: parsedVideos[0].thumbnailUrl,
        })
      }
    }

    if (savedHistory) {
      setWatchHistory(JSON.parse(savedHistory))
    }

    if (savedLiked) {
      setLikedVideos(JSON.parse(savedLiked))
    }
  }, [user.id])

  // Save data functions
  const saveVideos = (newVideos: VideoContent[]) => {
    const userVideosKey = `netflix-videos-${user.id}`
    localStorage.setItem(userVideosKey, JSON.stringify(newVideos))
    setVideos(newVideos)
  }

  const saveHistory = (history: VideoContent[]) => {
    const userHistoryKey = `netflix-history-${user.id}`
    localStorage.setItem(userHistoryKey, JSON.stringify(history))
    setWatchHistory(history)
  }

  const saveLiked = (liked: VideoContent[]) => {
    const userLikedKey = `netflix-liked-${user.id}`
    localStorage.setItem(userLikedKey, JSON.stringify(liked))
    setLikedVideos(liked)
  }

  const handleVideoUpload = async () => {
    if (!uploadForm.videoFile || !uploadForm.title) return

    const videoUrl = URL.createObjectURL(uploadForm.videoFile)
    let thumbnailUrl = "/placeholder.svg?height=300&width=200"

    if (uploadForm.thumbnailFile) {
      thumbnailUrl = URL.createObjectURL(uploadForm.thumbnailFile)
    }

    // Get video duration
    const video = document.createElement("video")
    video.src = videoUrl

    const duration = await new Promise<string>((resolve) => {
      video.onloadedmetadata = () => {
        const minutes = Math.floor(video.duration / 60)
        const seconds = Math.floor(video.duration % 60)
        resolve(`${minutes}:${seconds.toString().padStart(2, "0")}`)
      }
    })

    const newVideo: VideoContent = {
      id: Date.now().toString(),
      title: uploadForm.title,
      description: uploadForm.description,
      videoUrl,
      thumbnailUrl,
      category: uploadForm.category || "Uncategorized",
      duration,
      uploadDate: new Date().toLocaleDateString(),
      userId: user.id,
      views: 0,
      liked: false,
    }

    const updatedVideos = [...videos, newVideo]
    saveVideos(updatedVideos)

    // Set as featured if it's the first video
    if (videos.length === 0) {
      setFeaturedContent({
        title: newVideo.title,
        description: newVideo.description,
        image: newVideo.thumbnailUrl,
      })
    }

    // Reset form
    setUploadForm({
      title: "",
      description: "",
      category: "",
      videoFile: null,
      thumbnailFile: null,
    })
    setUploadOpen(false)
  }

  const playVideo = (video: VideoContent) => {
    // Update views
    const updatedVideo = { ...video, views: video.views + 1 }
    const updatedVideos = videos.map((v) => (v.id === video.id ? updatedVideo : v))
    saveVideos(updatedVideos)

    // Add to watch history
    const newHistory = [updatedVideo, ...watchHistory.filter((v) => v.id !== video.id)].slice(0, 20)
    saveHistory(newHistory)

    setCurrentVideo(updatedVideo)
    setPlayerOpen(true)
  }

  const toggleLike = (video: VideoContent) => {
    const isLiked = likedVideos.some((v) => v.id === video.id)
    let newLiked: VideoContent[]

    if (isLiked) {
      newLiked = likedVideos.filter((v) => v.id !== video.id)
    } else {
      newLiked = [...likedVideos, video]
    }

    saveLiked(newLiked)

    // Update video liked status
    const updatedVideos = videos.map((v) => (v.id === video.id ? { ...v, liked: !isLiked } : v))
    saveVideos(updatedVideos)
  }

  const deleteVideo = (videoId: string) => {
    const updatedVideos = videos.filter((v) => v.id !== videoId)
    saveVideos(updatedVideos)

    // Remove from liked and history
    const updatedLiked = likedVideos.filter((v) => v.id !== videoId)
    const updatedHistory = watchHistory.filter((v) => v.id !== videoId)
    saveLiked(updatedLiked)
    saveHistory(updatedHistory)

    if (updatedVideos.length === 0) {
      setFeaturedContent(defaultFeatured)
    }
  }

  const clearHistory = () => {
    saveHistory([])
  }

  const updateProfile = () => {
    const updatedUser = { ...user, name: profileForm.name, email: profileForm.email }
    localStorage.setItem("netflix-user", JSON.stringify(updatedUser))
    setProfileOpen(false)
  }

  // Group videos by category
  const videosByCategory = videos.reduce(
    (acc, video) => {
      if (!acc[video.category]) {
        acc[video.category] = []
      }
      acc[video.category].push(video)
      return acc
    },
    {} as Record<string, VideoContent[]>,
  )

  // Filter videos based on search
  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  function ContentRow({ title, items }: { title: string; items: VideoContent[] }) {
    const [scrollPosition, setScrollPosition] = useState(0)

    const scroll = (direction: "left" | "right") => {
      const container = document.getElementById(`row-${title.replace(/\s+/g, "-")}`)
      if (container) {
        const scrollAmount = 300
        const newPosition =
          direction === "left" ? Math.max(0, scrollPosition - scrollAmount) : scrollPosition + scrollAmount

        container.scrollTo({ left: newPosition, behavior: "smooth" })
        setScrollPosition(newPosition)
      }
    }

    if (items.length === 0) return null

    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 px-4 md:px-12">{title}</h2>
        <div className="relative group">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div
            id={`row-${title.replace(/\s+/g, "-")}`}
            className="flex gap-2 overflow-x-auto scrollbar-hide px-4 md:px-12 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 w-48 cursor-pointer transition-transform hover:scale-105 group/item"
              >
                <div className="relative aspect-[3/4] rounded-md overflow-hidden">
                  <Image src={item.thumbnailUrl || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => playVideo(item)}
                        size="sm"
                        className="bg-white text-black hover:bg-gray-200"
                      >
                        <Play className="h-3 w-3 mr-1 fill-current" />
                        Play
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLike(item)
                        }}
                        size="sm"
                        variant="secondary"
                        className={likedVideos.some((v) => v.id === item.id) ? "bg-red-600 hover:bg-red-700" : ""}
                      >
                        <Heart className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white opacity-0 group-hover/item:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteVideo(item.id)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {item.duration}
                  </div>
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {item.views} views
                  </div>
                </div>
                <p className="text-white text-sm mt-2 truncate">{item.title}</p>
                <p className="text-gray-400 text-xs truncate">{item.uploadDate}</p>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between px-4 md:px-12 py-4">
          <div className="flex items-center space-x-8">
            <div className="text-red-600 text-2xl font-bold">NETFLIX</div>
            <nav className="hidden md:flex space-x-6">
              <button
                onClick={() => setActiveTab("home")}
                className={`hover:text-gray-300 transition-colors ${activeTab === "home" ? "text-white" : "text-gray-400"}`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab("my-videos")}
                className={`hover:text-gray-300 transition-colors ${activeTab === "my-videos" ? "text-white" : "text-gray-400"}`}
              >
                My Videos ({videos.length})
              </button>
              <button
                onClick={() => setActiveTab("liked")}
                className={`hover:text-gray-300 transition-colors ${activeTab === "liked" ? "text-white" : "text-gray-400"}`}
              >
                Liked ({likedVideos.length})
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`hover:text-gray-300 transition-colors ${activeTab === "history" ? "text-white" : "text-gray-400"}`}
              >
                History ({watchHistory.length})
              </button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {searchOpen ? (
              <Input
                placeholder="Search videos..."
                className="w-64 bg-black/50 border-white/20 text-white placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  if (!searchQuery) setSearchOpen(false)
                }}
                autoFocus
              />
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="text-white hover:text-gray-300"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Video
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload New Video</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm((prev) => ({ ...prev, title: e.target.value }))}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Enter video title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Enter video description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={uploadForm.category}
                      onValueChange={(value) => setUploadForm((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="Action">Action</SelectItem>
                        <SelectItem value="Comedy">Comedy</SelectItem>
                        <SelectItem value="Drama">Drama</SelectItem>
                        <SelectItem value="Horror">Horror</SelectItem>
                        <SelectItem value="Documentary">Documentary</SelectItem>
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Gaming">Gaming</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="video">Video File *</Label>
                    <Input
                      id="video"
                      type="file"
                      accept="video/*"
                      onChange={(e) => setUploadForm((prev) => ({ ...prev, videoFile: e.target.files?.[0] || null }))}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="thumbnail">Thumbnail (Optional)</Label>
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setUploadForm((prev) => ({ ...prev, thumbnailFile: e.target.files?.[0] || null }))
                      }
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <Button
                    onClick={handleVideoUpload}
                    disabled={!uploadForm.videoFile || !uploadForm.title}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    Upload Video
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 text-white hover:text-gray-300">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black border-gray-800 w-56">
                <div className="px-3 py-2 border-b border-gray-800">
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                </div>
                <DropdownMenuItem className="text-white hover:bg-gray-800" onClick={() => setProfileOpen(true)}>
                  <UserIcon className="h-4 w-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-gray-800">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem className="text-red-400 hover:bg-gray-800" onClick={onLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {activeTab === "home" && (
        <>
          {/* Hero Section */}
          <section className="relative h-screen">
            <div className="absolute inset-0">
              <Image
                src={featuredContent.image || "/placeholder.svg"}
                alt={featuredContent.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>
            <div className="relative h-full flex items-center px-4 md:px-12">
              <div className="max-w-lg">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">{featuredContent.title}</h1>
                <p className="text-lg md:text-xl mb-8 text-gray-200">{featuredContent.description}</p>
                <div className="flex space-x-4">
                  {videos.length > 0 ? (
                    <Button
                      onClick={() => playVideo(videos[0])}
                      className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-lg font-semibold"
                    >
                      <Play className="h-5 w-5 mr-2 fill-current" />
                      Play
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setUploadOpen(true)}
                      className="bg-red-600 hover:bg-red-700 px-8 py-3 text-lg font-semibold"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Upload First Video
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Content Rows */}
          <main className="relative -mt-32 z-10">
            {searchQuery ? (
              <div className="px-4 md:px-12 mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Search Results for "{searchQuery}" ({filteredVideos.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredVideos.map((video) => (
                    <div key={video.id} className="cursor-pointer transition-transform hover:scale-105 group">
                      <div className="relative aspect-[3/4] rounded-md overflow-hidden">
                        <Image
                          src={video.thumbnailUrl || "/placeholder.svg"}
                          alt={video.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button onClick={() => playVideo(video)} className="bg-white text-black hover:bg-gray-200">
                            <Play className="h-4 w-4 mr-1 fill-current" />
                            Play
                          </Button>
                        </div>
                      </div>
                      <p className="text-white text-sm mt-2 truncate">{video.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {watchHistory.length > 0 && <ContentRow title="Continue Watching" items={watchHistory.slice(0, 10)} />}
                {likedVideos.length > 0 && <ContentRow title="Your Liked Videos" items={likedVideos} />}
                {Object.entries(videosByCategory).map(([category, categoryVideos]) => (
                  <ContentRow key={category} title={category} items={categoryVideos} />
                ))}

                {videos.length === 0 && (
                  <div className="text-center py-20 px-4">
                    <h2 className="text-2xl font-semibold text-white mb-4">Welcome, {user.name}!</h2>
                    <p className="text-gray-400 mb-8">
                      Upload your first video to start building your personal library
                    </p>
                    <Button onClick={() => setUploadOpen(true)} className="bg-red-600 hover:bg-red-700">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Video
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </>
      )}

      {/* My Videos Tab */}
      {activeTab === "my-videos" && (
        <div className="pt-24 px-4 md:px-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">My Videos</h1>
            <Badge variant="secondary" className="bg-red-600 text-white">
              {videos.length} videos
            </Badge>
          </div>
          {videos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {videos.map((video) => (
                <div key={video.id} className="cursor-pointer transition-transform hover:scale-105 group">
                  <div className="relative aspect-[3/4] rounded-md overflow-hidden">
                    <Image
                      src={video.thumbnailUrl || "/placeholder.svg"}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => playVideo(video)}
                          size="sm"
                          className="bg-white text-black hover:bg-gray-200"
                        >
                          <Play className="h-3 w-3 mr-1 fill-current" />
                          Play
                        </Button>
                        <Button onClick={() => deleteVideo(video.id)} size="sm" variant="destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.views} views
                    </div>
                  </div>
                  <p className="text-white text-sm mt-2 truncate">{video.title}</p>
                  <p className="text-gray-400 text-xs truncate">
                    {video.category} • {video.uploadDate}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-xl font-semibold text-white mb-4">No videos uploaded yet</h2>
              <Button onClick={() => setUploadOpen(true)} className="bg-red-600 hover:bg-red-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Video
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Liked Videos Tab */}
      {activeTab === "liked" && (
        <div className="pt-24 px-4 md:px-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Liked Videos</h1>
            <Badge variant="secondary" className="bg-red-600 text-white">
              {likedVideos.length} videos
            </Badge>
          </div>
          {likedVideos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {likedVideos.map((video) => (
                <div key={video.id} className="cursor-pointer transition-transform hover:scale-105 group">
                  <div className="relative aspect-[3/4] rounded-md overflow-hidden">
                    <Image
                      src={video.thumbnailUrl || "/placeholder.svg"}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button onClick={() => playVideo(video)} className="bg-white text-black hover:bg-gray-200">
                        <Play className="h-4 w-4 mr-1 fill-current" />
                        Play
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                      <Heart className="h-3 w-3 fill-current" />
                    </div>
                  </div>
                  <p className="text-white text-sm mt-2 truncate">{video.title}</p>
                  <p className="text-gray-400 text-xs truncate">
                    {video.category} • {video.views} views
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-4">No liked videos yet</h2>
              <p className="text-gray-400">Like videos to see them here</p>
            </div>
          )}
        </div>
      )}

      {/* Watch History Tab */}
      {activeTab === "history" && (
        <div className="pt-24 px-4 md:px-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Watch History</h1>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-red-600 text-white">
                {watchHistory.length} videos
              </Badge>
              {watchHistory.length > 0 && (
                <Button onClick={clearHistory} variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear History
                </Button>
              )}
            </div>
          </div>
          {watchHistory.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {watchHistory.map((video) => (
                <div key={video.id} className="cursor-pointer transition-transform hover:scale-105 group">
                  <div className="relative aspect-[3/4] rounded-md overflow-hidden">
                    <Image
                      src={video.thumbnailUrl || "/placeholder.svg"}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button onClick={() => playVideo(video)} className="bg-white text-black hover:bg-gray-200">
                        <Play className="h-4 w-4 mr-1 fill-current" />
                        Play
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.views} views
                    </div>
                  </div>
                  <p className="text-white text-sm mt-2 truncate">{video.title}</p>
                  <p className="text-gray-400 text-xs truncate">{video.category}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-4">No watch history yet</h2>
              <p className="text-gray-400">Videos you watch will appear here</p>
            </div>
          )}
        </div>
      )}

      {/* Video Player Modal */}
      <Dialog open={playerOpen} onOpenChange={setPlayerOpen}>
        <DialogContent className="max-w-4xl w-full bg-black border-none p-0">
          {currentVideo && (
            <div className="relative">
              <video
                src={currentVideo.videoUrl}
                controls
                autoPlay
                className="w-full h-auto max-h-[80vh]"
                onEnded={() => setPlayerOpen(false)}
              >
                Your browser does not support the video tag.
              </video>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{currentVideo.title}</h3>
                    <p className="text-gray-300 mb-4">{currentVideo.description}</p>
                  </div>
                  <Button
                    onClick={() => toggleLike(currentVideo)}
                    variant="ghost"
                    size="icon"
                    className={`${likedVideos.some((v) => v.id === currentVideo.id) ? "text-red-500" : "text-white"} hover:text-red-500`}
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <span>Duration: {currentVideo.duration}</span>
                  <span>Category: {currentVideo.category}</span>
                  <span>Views: {currentVideo.views}</span>
                  <span>Uploaded: {currentVideo.uploadDate}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Profile Settings Modal */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-gray-400 text-sm">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={profileForm.name}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={updateProfile} className="bg-red-600 hover:bg-red-700">
                Save Changes
              </Button>
              <Button onClick={() => setProfileOpen(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

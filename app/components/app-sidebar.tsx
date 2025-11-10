import {
  Bell,
  Calendar,
  CheckSquare,
  ChevronDown,
  Folder,
  Inbox,
  MessageCircle,
  Plus,
  Settings,
  Tag,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const primaryItems = [
  { title: "Ask AI", icon: MessageCircle, url: "#", isActive: true },
  { title: "Task", icon: CheckSquare, url: "#" },
  { title: "Inbox", icon: Inbox, url: "#" },
  { title: "Timeline", icon: Calendar, url: "#" },
]

const knowledgeItems = [
  { title: "Folders", icon: Folder, url: "#" },
  { title: "Tags", icon: Tag, url: "#" },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium leading-snug">berat</p>
            <p className="text-xs text-muted-foreground">Trial Plan</p>
          </div>
          <button className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium text-muted-foreground transition hover:text-foreground">
            Add
            <ChevronDown className="size-3.5" />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button className="inline-flex size-8 items-center justify-center rounded-full border text-muted-foreground transition hover:text-foreground">
            <MessageCircle className="size-4" />
          </button>
          <button className="inline-flex size-8 items-center justify-center rounded-full border text-muted-foreground transition hover:text-foreground">
            <Calendar className="size-4" />
          </button>
          <button className="inline-flex size-8 items-center justify-center rounded-full border text-muted-foreground transition hover:text-foreground">
            <Bell className="size-4" />
          </button>
          <button className="inline-flex size-8 items-center justify-center rounded-full border text-muted-foreground transition hover:text-foreground">
            <Settings className="size-4" />
          </button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={item.isActive}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Knowledge</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {knowledgeItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t px-4 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Plus className="size-4" />
              <span>New feature request</span>
            </SidebarMenuButton>
            <SidebarMenuAction>
              <ChevronDown className="size-4" />
            </SidebarMenuAction>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
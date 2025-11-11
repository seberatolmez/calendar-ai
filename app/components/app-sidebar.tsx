import {
  Calendar,
  CheckSquare,
  Folder,
  Inbox,
  MessageCircle,
  Tag,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const primaryItems = [
  { title: "Ask AI", icon: MessageCircle, url: "/garbi"},
  { title: "Task", icon: CheckSquare, url: "#" },
  { title: "Inbox", icon: Inbox, url: "#" },
  { title: "Timeline", icon: Calendar, url: "/timeline" },
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
          <p className="text-sm font-medium leading-snug">berat</p>
          <p className="text-xs text-muted-foreground">Trial Plan</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                    <a href={item.url}></a>
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
    </Sidebar>
  )
}
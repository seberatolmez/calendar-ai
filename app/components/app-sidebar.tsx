import {
  CalendarDays,
  CheckSquare,
  Folder,
  Zap,
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

import { usePathname,useRouter } from "next/navigation"



const primaryItems = [
  { title: "Ask AI", icon: Zap, url: "/",special: "askAI"},
  { title: "Task", icon: CheckSquare, url: "#" }, // to be implemented later 
  { title: "Timeline", icon: CalendarDays, url: "/timeline" },
]

const knowledgeItems = [
  { title: "Folders", icon: Folder, url: "#" },
  { title: "Tags", icon: Tag, url: "#" },
]

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();

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
              {primaryItems.map((item) => {
                const isActive = pathname === item.url;
                const isAskAi = item.special === "askAI";
                
                return (
                  <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className={isAskAi ? "text-[var(--color-blue)] font-semibold" : ""}
                    variant={isAskAi ? "askAI": "outline"}
                    onClick={() => router.push(item.url)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon/>
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                )
                
      })}
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
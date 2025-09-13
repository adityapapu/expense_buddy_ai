import {Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle} from "@heroui/navbar";
import {Link} from "@heroui/link";
import {auth} from "@/auth";
import UserAvatarDropdown from "@/components/layout/UserAvatarDropdown";

export default async function NavbarComponent() {
    const session = await auth();
    if(!session?.user){
        return null;
    }
  return (
    <Navbar>
      <NavbarBrand>
        <p className="font-bold text-inherit">Expense Tracker</p>
      </NavbarBrand>
      <NavbarContent className="hidden gap-4 sm:flex" justify="center">
        <NavbarItem>
          <Link color="foreground" href="/">
            Dashboard
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/transactions">
            Transactions
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/budgets">
            Budgets
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/analytics">
            Analytics
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/friends">
            Friends
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/settings">
            Settings
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarMenuToggle className="md:hidden" />
        <UserAvatarDropdown user={session.user}/>
      </NavbarContent>
      <NavbarMenu className="md:hidden">
        <NavbarMenuItem>
          <Link color="foreground" href="/" className="w-full">
            Dashboard
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link color="foreground" href="/transactions" className="w-full">
            Transactions
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link color="foreground" href="/scan" className="w-full">
            Scan & Pay
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link color="foreground" href="/budgets" className="w-full">
            Budgets
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link color="foreground" href="/analytics" className="w-full">
            Analytics
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link color="foreground" href="/friends" className="w-full">
            Friends
          </Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link color="foreground" href="/settings" className="w-full">
            Settings
          </Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
);
}

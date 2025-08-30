import {Navbar, NavbarBrand, NavbarContent, NavbarItem} from "@heroui/navbar";
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
          <Link color="foreground" href="/scan">
            Scan & Pay
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/budgets">
            Budgets
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/reports">
            Reports
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
        <NavbarContent as="div" justify="end">
            <UserAvatarDropdown user={session.user}/>
        </NavbarContent>
    </Navbar>
);
}

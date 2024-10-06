import {Navbar, NavbarBrand, NavbarContent, NavbarItem} from "@nextui-org/navbar";
import {Link} from "@nextui-org/link";
import {auth} from "@/auth";
import UserAvatarDropdown from "@/components/layout/UserAvatarDropdown";

export default async function NavbarComponent() {
    // const session = await auth();
    // if(!session?.user){
    //     return null;
    // }
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
          <Link color="foreground" href="/">
            Transactions
          </Link>
        </NavbarItem>
      </NavbarContent>
        <NavbarContent as="div" justify="end">
            {/* <UserAvatarDropdown user={session.user}/> */}
        </NavbarContent>
    </Navbar>
);
}

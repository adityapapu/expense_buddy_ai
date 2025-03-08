"use client";
import React from 'react'
import {User} from "next-auth";
import {Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@heroui/dropdown";
import {Avatar} from "@heroui/avatar";
import { signOut } from "next-auth/react"


const UserAvatarDropdown = ({user}: {user:User}) => {
    return (
        <Dropdown placement="bottom-end">
            <DropdownTrigger>
                <Avatar
                    isBordered
                    as="button"
                    className="transition-transform"
                    color="secondary"
                    name={user?.name? user?.name : ''}
                    size="sm"
                    src={user?.image? user?.image : "" }
                />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                    <p className="font-semibold">Signed in as</p>
                    <p className="font-semibold">{user?.name}</p>
                </DropdownItem>
                <DropdownItem key="settings">My Settings</DropdownItem>
                <DropdownItem key="analytics">Analytics</DropdownItem>
                <DropdownItem key="configurations">Configurations</DropdownItem>
                <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
                <DropdownItem key="logout" color="danger" onClick={async () => {
                    await signOut({redirect:true, callbackUrl:'/logout'});
                }
                }>
                    Log Out
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}
export default UserAvatarDropdown

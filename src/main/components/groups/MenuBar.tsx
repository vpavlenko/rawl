import React, { ReactNode, StatelessComponent } from "react"
import f from "helpers/flatJoin"

import "./MenuBar.css"

export interface MenuTemplateItem {
  label: string
  role?: string
  submenu?: MenuTemplateItem[]
  click?: (e: any) => void
}

export function fromTemplate(t: MenuTemplateItem[]) {
  return (
    <MenuBar>
      {t.map((t) => (
        <MenuItem title={t.label}>
          {t.submenu && (
            <SubMenu>
              {t.submenu.map((t) => (
                <MenuItem title={t.role || t.label} onClick={t.click} />
              ))}
            </SubMenu>
          )}
        </MenuItem>
      ))}
    </MenuBar>
  )
}

export interface MenuBarProps {
  className?: string
}

export const MenuBar: StatelessComponent<MenuBarProps> = ({
  children,
  className,
}) => {
  return <div className={f("MenuBar", className)}>{children}</div>
}

export interface MenuItemProps {
  className?: string
  title: ReactNode
  onClick?: (e: any) => void
}

export const MenuItem: StatelessComponent<MenuItemProps> = ({
  children,
  className,
  title,
  onClick,
}) => {
  return (
    <div className={f("MenuItem", className)} onClick={onClick}>
      <div className="title">{title}</div>
      {children}
    </div>
  )
}

export interface SubMenuProps {
  className?: string
}

export const SubMenu: StatelessComponent<SubMenuProps> = ({
  children,
  className,
}) => {
  return <div className={f("SubMenu", className)}>{children}</div>
}

export interface MenuSeparatorProps {
  className?: string
}

export const MenuSeparator: StatelessComponent<MenuSeparatorProps> = ({
  className,
}) => {
  return <div className={f("MenuSeparator", className)} />
}

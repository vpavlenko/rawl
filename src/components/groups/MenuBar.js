import React from "react"
import f from "helpers/flatJoin"

import "./MenuBar.css"

export function fromTemplate(t) {
  return <MenuBar>
    {t.map(t => <MenuItem title={t.label}>
      {t.submenu && <SubMenu>
        {t.submenu.map(t => <MenuItem
          title={t.role || t.label}
          onClick={t.click}
        />)}
      </SubMenu>}
    </MenuItem>)}
  </MenuBar>
}

export function MenuBar({
  children,
  className
}) {
  return <div className={f("MenuBar", className)}>
    {children}
  </div>
}

export function MenuItem({
  children,
  className,
  title,
  onClick
}) {
  return <div
    className={f("MenuItem", className)}
    onClick={onClick}>
    <div className="title">{title}</div>
    {children}
  </div>
}

export function SubMenu({
  children,
  className
}) {
  return <div
    className={f("SubMenu", className)}>
    {children}
  </div>
}

export function MenuSeparator({ className }) {
  return <div className={f("MenuSeparator", className)} />
}

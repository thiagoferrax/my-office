import React from 'react'
import MenuItem from './menuItem'
import MenuTree from './menuTree'

export default props => (
    <ul className='sidebar-menu' data-widget="tree">
        <MenuItem path='/' label='Dashboard' icon='stats' />
        <MenuTree label='Management' icon='rocket'> 
            <MenuItem path='rooms' label='Rooms' icon='cube' />    
            <MenuItem path='employees' label='Employees' icon='people' />
            <MenuItem path='equipments' label='Equipments' icon='laptop' />      
            <MenuItem path='desks' label='Workstations' icon='desktop' />  
        </MenuTree>
        <MenuItem path='timeline' label='Timeline' icon='calendar' />      
    </ul>
)
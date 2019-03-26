import React from 'react'
import MenuItem from './menuItem'
import MenuTree from './menuTree'

export default props => (
    <ul className='sidebar-menu' data-widget="tree">
        <MenuItem path='/' label='Dashboard' icon='stats' />
        <MenuTree label='Management' icon='rocket'> 
            <MenuItem path='projects' label='Rooms' icon='cube' />    
            <MenuItem path='evaluations' label='Desks' icon='options' />  
        </MenuTree>
        <MenuItem path='timeline' label='Timeline' icon='calendar' />      
    </ul>
)
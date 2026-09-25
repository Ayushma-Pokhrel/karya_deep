import {
    FaTint,
    FaDumbbell,
    FaBed,
    FaBook,
    FaPhone,
    FaClipboardList,
    FaWallet,
    FaBriefcase,
    FaHome,
    FaUsers,
    FaLaptopCode,
    FaPalette,
    FaStar,
} from "react-icons/fa"

const CATEGORY_ICONS = {
    Health: FaTint,
    Fitness: FaDumbbell,
    Wellness: FaBed,
    "Personal Growth": FaBook,
    Relationships: FaPhone,
    Productivity: FaClipboardList,
    Finance: FaWallet,
    Career: FaBriefcase,
    Chores: FaHome,
    Community: FaUsers,
    "Skill Building": FaLaptopCode,
    Hobby: FaPalette,
}

export const getHabitIcon = (category) => CATEGORY_ICONS[category] || FaStar;
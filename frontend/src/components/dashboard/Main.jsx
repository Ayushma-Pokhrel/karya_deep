import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Cards from  "./Cards";
import { FaCalendarAlt, FaMagic, FaSpinner, FaPlus} from "react-icons/fa";

const choices = ["High", "Medium", "Low"];
const QUICK_ADD_LIMIT = 8;
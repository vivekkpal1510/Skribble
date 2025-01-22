package com.backend.backend.helper;

import java.util.ArrayList;
import java.util.Map;

public class AllFunctions {
		
	public String createRoom(Map<String, ArrayList<String>> rooms) {
		String res = "room" ;
		int size = rooms.size();
		res += ""+size ;
		return res ;
	}
	
	
	
}

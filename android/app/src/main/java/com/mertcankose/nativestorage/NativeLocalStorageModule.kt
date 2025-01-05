package com.mertcankose.nativestorage

import android.content.Context
import android.content.SharedPreferences
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableNativeArray
import com.nativelocalstorage.NativeLocalStorageSpec
import org.json.JSONArray
import org.json.JSONException
import java.util.concurrent.ConcurrentHashMap

class NativeLocalStorageModule(reactContext: ReactApplicationContext) : NativeLocalStorageSpec(reactContext) {

  private val cache = ConcurrentHashMap<String, Array<String>>()
  private val sharedPref: SharedPreferences by lazy {
    getReactApplicationContext().getSharedPreferences("my_prefs", Context.MODE_PRIVATE)
  }

  override fun getName() = NAME

  override fun setItem(value: String, key: String) {
    val editor = sharedPref.edit()
    editor.putString(key, value)
    editor.apply()
  }

  override fun getItem(key: String): String? {
    return sharedPref.getString(key, null)
  }

  override fun setStringArray(value: ReadableArray, key: String) {
    try {
      val jsonArray = JSONArray()
      for (i in 0 until value.size()) {
        jsonArray.put(value.getString(i))
      }
      val editor = sharedPref.edit()
      editor.putString(key, jsonArray.toString())
      editor.apply()
      cache[key] = Array(value.size()) { i -> value.getString(i) }
    } catch (e: JSONException) {
      e.printStackTrace()
    }
  }

  override fun getStringArray(key: String): WritableArray? {
    try {
      // First check cache
      cache[key]?.let { 
        val array = WritableNativeArray()
        it.forEach { item -> array.pushString(item) }
        return array
      }

      // If not in cache, get from storage
      val jsonString = sharedPref.getString(key, null) ?: return null
      val jsonArray = JSONArray(jsonString)
      val result = WritableNativeArray()
      for (i in 0 until jsonArray.length()) {
        result.pushString(jsonArray.getString(i))
      }
      
      // Update cache
      cache[key] = Array(jsonArray.length()) { i -> jsonArray.getString(i) }
      return result
    } catch (e: JSONException) {
      e.printStackTrace()
      return null
    }
  }

  override fun appendToStringArray(value: String, key: String) {
    try {
      val currentArray = getStringArray(key)
      val newArray = WritableNativeArray()
      
      // Copy existing items
      if (currentArray != null) {
        for (i in 0 until currentArray.size()) {
          newArray.pushString(currentArray.getString(i))
        }
      }
      
      // Add new item
      newArray.pushString(value)
      
      // Save the updated array
      setStringArray(newArray, key)
    } catch (e: Exception) {
      e.printStackTrace()
    }
  }

  override fun setStringArrayBulk(value: ReadableArray, key: String) {
    setStringArray(value, key)
  }

  override fun removeItem(key: String) {
    val editor = sharedPref.edit()
    editor.remove(key)
    editor.apply()
    cache.remove(key)
  }

  override fun clear() {
    val editor = sharedPref.edit()
    editor.clear()
    editor.apply()
    cache.clear()
  }

  companion object {
    const val NAME = "NativeLocalStorage"
  }
}
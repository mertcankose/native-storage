//
//  RCTNativeLocalStorage.mm
//  batteryapp
//
//  Created by Mertcan Köse on 5.01.2025.
//

#import "RCTNativeLocalStorage.h"

static NSString *const RCTNativeLocalStorageKey = @"local-storage";

@interface RCTNativeLocalStorage()
@property (strong, nonatomic) NSUserDefaults *localStorage;
@property (strong, nonatomic) NSMutableDictionary *cache;
@end

@implementation RCTNativeLocalStorage

RCT_EXPORT_MODULE(NativeLocalStorage)

- (id) init {
  if (self = [super init]) {
    _localStorage = [[NSUserDefaults alloc] initWithSuiteName:RCTNativeLocalStorageKey];
    _cache = [NSMutableDictionary new];
  }
  return self;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeLocalStorageSpecJSI>(params);
}

- (NSString * _Nullable)getItem:(NSString *)key {
  return [self.localStorage stringForKey:key];
}

- (void)setItem:(NSString *)value
          key:(NSString *)key {
  [self.localStorage setObject:value forKey:key];
}

- (NSArray<NSString *> * _Nullable)getStringArray:(NSString *)key {
  // First check cache
  NSArray<NSString *> *cachedArray = self.cache[key];
  if (cachedArray) {
    return cachedArray;
  }
  
  // If not in cache, get from storage
  NSArray<NSString *> *array = [self.localStorage arrayForKey:key];
  if (array) {
    // Store in cache for future use
    self.cache[key] = array;
  }
  return array;
}

- (void)setStringArray:(NSArray<NSString *> *)value key:(NSString *)key {
  [self.localStorage setObject:value forKey:key];
  // Update cache
  self.cache[key] = value;
}

- (void)appendToStringArray:(NSString *)value key:(NSString *)key {
  NSArray<NSString *> *existingArray = [self getStringArray:key];
  NSMutableArray<NSString *> *newArray;
  
  if (existingArray) {
    newArray = [existingArray mutableCopy];
  } else {
    newArray = [NSMutableArray array];
  }
  
  [newArray addObject:value];
  [self setStringArray:newArray key:key];
}

- (void)removeItem:(NSString *)key {
  [self.localStorage removeObjectForKey:key];
  [self.cache removeObjectForKey:key];
}

- (void)clear {
  NSDictionary *keys = [self.localStorage dictionaryRepresentation];
  for (NSString *key in keys) {
    [self removeItem:key];
  }
  [self.cache removeAllObjects];
}

- (void)setStringArrayBulk:(NSArray<NSString *> *)value key:(NSString *)key {
  [self.localStorage setObject:value forKey:key];
  self.cache[key] = value;
}

@end

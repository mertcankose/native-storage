//
//  RCTNativeLocalStorage.h
//  batteryapp
//
//  Created by Mertcan Köse on 5.01.2025.
//

#import <Foundation/Foundation.h>
#import <NativeLocalStorageSpec/NativeLocalStorageSpec.h>

NS_ASSUME_NONNULL_BEGIN

@interface RCTNativeLocalStorage : NSObject <NativeLocalStorageSpec>
- (NSArray<NSString *> * _Nullable)getStringArray:(NSString *)key;
- (void)setStringArray:(NSArray<NSString *> *)value key:(NSString *)key;
- (void)appendToStringArray:(NSString *)value key:(NSString *)key;
@end

NS_ASSUME_NONNULL_END

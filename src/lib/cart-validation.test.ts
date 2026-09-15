import { expect, it } from "vitest";
import { parseCart } from "./cart-validation";
const item = {id:"birthday/test",productId:"00000000-0000-4000-8000-000000000100",categorySlug:"birthday",categoryName:"Birthday",serviceSlug:"test",serviceName:"Test",image:"/test.png",unitPrice:500,quantity:1,addOns:[]};
it("rejects corrupted storage without crashing cart rendering",()=>{
  expect(parseCart({items:[]})).toEqual([]);
  expect(parseCart([null,{...item,quantity:-1},{...item,addOns:null},{...item,unitPrice:"500"}])).toEqual([]);
  expect(parseCart([item,null])).toEqual([item]);
});

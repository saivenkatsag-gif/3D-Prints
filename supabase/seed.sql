insert into categories (name, slug, description, sort_order) values
 ('3D Printed Toys','3d-printed-toys','Articulated and playable',1),
 ('Fidget Toys','fidget-toys','Click, spin, relax',2),
 ('Keychains','keychains','Add your name',3),
 ('Desk Accessories','desk-accessories','Tidy and playful',4),
 ('Home Décor','home-decor','Planters and lamps',5),
 ('Miniatures & Collectibles','miniatures-collectibles','Tiny and detailed',6),
 ('Mobile Accessories','mobile-accessories','Stands and grips',7),
 ('Customised Gifts','customised-gifts','Made just for them',8),
 ('Educational Toys','educational-toys','Learn by building',9),
 ('Creative Accessories','creative-accessories','Wear and display',10);

insert into products (slug,name,description,price,compare_at_price,material,dimensions,production_days,in_stock,featured,sales_count,customisation) values
 ('flexi-dragon','Articulated Flexi Dragon','A fully jointed dragon that bends, twists and stands on your desk. Printed in one piece.',399,499,'PLA','Medium: 28 cm long','2 to 4 days',true,true,98,
  '{"colours":[{"name":"Blue","hex":"#4F7CFF","multi":true},{"name":"Mint","hex":"#2FCB97","multi":true},{"name":"Coral","hex":"#FF6B5E","multi":true}],"sizes":[{"label":"Small","price":349},{"label":"Medium","price":399},{"label":"Large","price":499}]}'),
 ('name-keychain','Name Keychain','Your name, printed in bold rounded letters on a sturdy ring.',149,null,'PLA','8 cm x 3 cm','2 days',true,true,95,
  '{"colours":[{"name":"Coral","hex":"#FF6B5E"},{"name":"Sun","hex":"#FFC933"},{"name":"Lilac","hex":"#A98BFF"},{"name":"Ink","hex":"#34305A"}],"text":{"label":"Name on keychain","maxLength":12,"fonts":["Rounded","Block"],"colour":true},"notes":true}'),
 ('spiral-fidget-spinner','Spiral Fidget Spinner','Smooth spinning with a spiral shape that looks great in motion.',249,null,'PETG','7 cm wide','2 days',true,false,70,
  '{"colours":[{"name":"Mint","hex":"#2FCB97"},{"name":"Pink","hex":"#FF8FC2"}]}'),
 ('desk-phone-stand','Desk Phone Stand','Angled stand that holds any phone for video calls and desk use.',329,399,'PLA','11 cm x 9 cm','3 days',true,false,80,
  '{"colours":[{"name":"Ink","hex":"#34305A"},{"name":"Blue","hex":"#4F7CFF"}]}'),
 ('moon-lamp-shade','Moon Lamp Shade','A cratered moon shade that glows warm on a bedside table.',699,null,'PLA','15 cm diameter','4 days',true,true,66,
  '{"colours":[{"name":"Sun","hex":"#FFC933"},{"name":"Lilac","hex":"#A98BFF"}],"notes":true}'),
 ('tiny-dino','Tiny Dino Collectible','A pocket-sized dino with real detail. Collect them all.',199,null,'PLA','6 cm tall','2 days',true,false,74,
  '{"colours":[{"name":"Mint","hex":"#2FCB97"},{"name":"Coral","hex":"#FF6B5E"},{"name":"Sun","hex":"#FFC933"}]}'),
 ('custom-photo-frame','Custom Photo Frame','Send us a picture and a message. We print a frame that fits it.',549,649,'PLA','A5 size','4 to 5 days',true,false,88,
  '{"colours":[{"name":"Lilac","hex":"#A98BFF"},{"name":"Blue","hex":"#4F7CFF"}],"text":{"label":"Message on the frame","maxLength":20,"fonts":["Rounded","Block"]},"referenceImage":true,"notes":true}'),
 ('pen-pot-octopus','Pen Pot Octopus','An octopus whose arms hold your pens.',299,null,'PLA','10 cm tall','3 days',false,false,52,
  '{"colours":[{"name":"Pink","hex":"#FF8FC2"},{"name":"Lilac","hex":"#A98BFF"}]}');

insert into product_categories (product_id, category_id)
select p.id, c.id from (values
 ('flexi-dragon','3d-printed-toys'),('name-keychain','keychains'),('name-keychain','customised-gifts'),
 ('spiral-fidget-spinner','fidget-toys'),('desk-phone-stand','desk-accessories'),('desk-phone-stand','mobile-accessories'),
 ('moon-lamp-shade','home-decor'),('tiny-dino','miniatures-collectibles'),('tiny-dino','3d-printed-toys'),
 ('custom-photo-frame','customised-gifts'),('custom-photo-frame','home-decor'),('pen-pot-octopus','creative-accessories')
) v(ps, cs) join products p on p.slug = v.ps join categories c on c.slug = v.cs;

"""Deterministic fictional orders; never reads production. Standard library only."""
import csv, hashlib, json, random
from datetime import datetime,timedelta,timezone
from pathlib import Path
from zoneinfo import ZoneInfo
ROOT=Path(__file__).resolve().parent
def generate():
 r=random.Random(20261019);orders=[];lines=[];notices=[];pairs=[]
 menu=[('Chicken wrap',6.5),('Lamb rice',9.5),('Veggie burger',5.5),('Chips',2.5),('Mango drink',2),('Grilled chicken',10),('Mixed salad',4),('Falafel wrap',6),('Wings',5.5),('Chocolate shake',4.5),('Rice box',7),('Water',1.5)]
 for i in range(240):
  oid=f'DEMO-{i+1:04d}';kind=r.choice(['delivery','collection']);method=r.choice(['card','pay-at-shop','cash-on-delivery']);status=r.choices(['confirmed','cancelled','payment_failed','pending_payment'],[75,13,8,4])[0]
  if method!='card' and status in ('payment_failed','pending_payment'):status='confirmed'
  ps='paid' if method=='card' and status=='confirmed' else 'failed' if status=='payment_failed' else 'unpaid'
  dt=datetime(2026,7,1,tzinfo=timezone.utc)+timedelta(days=r.randrange(92),hours=r.choice([11,12,13,16,17,18,18,19,19,20,21]),minutes=r.randrange(60));local=dt.astimezone(ZoneInfo('Europe/London'))
  subtotal=0;basket=[]
  for j,(name,price) in enumerate(r.sample(menu,r.randint(1,4))):
   qty=r.randint(1,3);key=hashlib.md5(name.lower().encode()).hexdigest();value=round(qty*price,2);subtotal+=value;basket.append((key,name))
   lines.append(dict(order_id=oid,line_number=j+1,product_key=key,product_name=name,quantity=qty,listed_unit_price_gbp=price,indicative_line_value_gbp=value,is_invalid_line=0))
  delivery=2.5 if kind=='delivery' else 0;total=round(subtotal+delivery+.5,2);timed=status=='confirmed' and r.random()>.15
  prep=round(r.uniform(3,45),4) if timed else None
  if timed and i%37==0:prep=round(r.uniform(500,3000),4)
  invalid=timed and i%71==0
  raw=-4 if invalid else prep
  if invalid:prep=None
  ack=round(r.uniform(.3,12),4) if timed and r.random()>.15 else None
  life=round((prep or 0)+r.uniform(5,60),4) if timed else None
  row=dict(order_id=oid,order_datetime_utc=dt.isoformat(),order_datetime_local=local.replace(tzinfo=None).isoformat(),order_date=local.date().isoformat(),order_hour=local.hour,order_type=kind,order_status=status,payment_method=method,payment_status=ps,fulfilment_mode='asap',subtotal_gbp=subtotal,delivery_fee_gbp=delivery,gross_order_value_gbp=total,confirmed_card_value_gbp=total if ps=='paid' and method=='card' else 0,offline_order_value_gbp=total if method!='card' else 0,confirmed_offline_order_value_gbp=total if method!='card' and status=='confirmed' else 0,is_card_order=int(method=='card'),is_cancelled=int(status=='cancelled'),is_payment_failed=int(ps=='failed'),has_completion_timestamp=int(life is not None),missing_preparing=int(not timed),missing_ready=int(not timed),missing_completed=int(life is None),missing_acknowledged=int(ack is None),missing_created=0,raw_preparation_minutes=raw,preparation_minutes=prep,acknowledgement_minutes=ack,lifecycle_minutes=life,is_overnight_prep=int(prep is not None and prep>480),is_prep_outlier=int(prep is not None and prep>120),invalid_timestamp_sequence=int(invalid),money_warning=0,invalid_items_container=0,empty_items=0,item_line_count=len(basket),invalid_item_lines=0,indicative_items_value_gbp=subtotal,item_subtotal_delta_gbp=0,unitemised_adjustment_gbp=.5,model_service_charge_gbp=.5,order_total_delta_gbp=0,inconsistent_payment_state=0)
  # Include visible quality problems in the fictional demo; the invalid line is retained.
  if i%83==0:
   row['inconsistent_payment_state']=1;row['payment_status']='paid';row['payment_method']='pay-at-shop';row['is_card_order']=0;row['confirmed_card_value_gbp']=0;row['offline_order_value_gbp']=total;row['confirmed_offline_order_value_gbp']=total if status=='confirmed' else 0
  orders.append(row)
  events=1 if status=='confirmed' else 0;failed=int(events and i%19==0);pending=int(events and not failed and i%31==0);attempts=events+r.randrange(3)*events
  notices.append(dict(order_id=oid,notification_events=events,sent_notification_events=events-failed-pending,failed_notification_events=failed,pending_notification_events=pending,notification_attempts=attempts,retry_attempts=max(attempts-events,0),failed_endpoints=failed,delivered_endpoints=(events-failed-pending)*2,has_notification_failure=failed))
  for a in range(len(basket)):
   for b in range(a+1,len(basket)):
    first,second=sorted([basket[a],basket[b]])
    pairs.append(dict(order_id=oid,product_a=first[0],product_b=second[0],name_a=first[1],name_b=second[1]))
 return dict(metadata=dict(classification='synthetic',seed=20261019,notice='Fictional demonstration. Not audited revenue or observed restaurant performance.',currency='GBP',timezone='Europe/London'),orders=orders,menu_items=lines,notifications=notices,item_pairs=pairs)
def write():
 data=generate();out=ROOT/'dashboard';out.mkdir(parents=True,exist_ok=True)
 encoded={k:{'columns':list(data[k][0]),'rows':[list(row.values()) for row in data[k]]} for k in ['orders','menu_items','notifications','item_pairs']}
 (out/'demo-data.js').write_text('/* Generated fictional data; expand compact rows without external dependencies. */\nglobalThis.DEMO_DATA = (() => { const tables = '+json.dumps(encoded,separators=(',',':'))+'; const data = {metadata:'+json.dumps(data['metadata'],separators=(',',':'))+'}; for(const [key,t] of Object.entries(tables)) data[key]=t.rows.map(row=>Object.fromEntries(t.columns.map((c,i)=>[c,row[i]]))); return data; })();\n')
 for key in ['orders','menu_items','notifications','item_pairs']:
  with (out/f'{key}.csv').open('w',newline='') as f:
   w=csv.DictWriter(f,fieldnames=list(data[key][0]));w.writeheader();w.writerows(data[key])
 (out/'provenance.json').write_text(json.dumps(data['metadata'],indent=2)+'\n')
 print('Generated 240 synthetic orders and related tables; no production inputs')
if __name__=='__main__':write()

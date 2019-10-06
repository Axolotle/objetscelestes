import json

from astropy import units as u
from astropy.coordinates import SkyCoord


data = None
types = []
code = 'UMa'

with open('hand/' + code + '-removeDupls.json') as target:
    data = json.load(target)

stars = []
for star in data['stars']:
    c = SkyCoord(' '.join([star['ra'], star['dec']]), unit=(u.hourangle, u.deg), frame='icrs')
    c.representation_type = 'cartesian'
    dist = star['dist']['value']
    star['pos'] = [c.x.to_value() * dist, c.y.to_value() * dist, c.z.to_value() * dist]
    stars.append(star)


stars = sorted(stars, key=lambda star: star['vmag'])
with open('../website/data/' + code + '.json', 'w') as output:
    output.write((
        '[\n    '
        + ',\n    '.join([json.dumps(star) for star in stars])
        + '\n]'
    ))
